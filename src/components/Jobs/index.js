import {Component} from 'react'
import {FaSearch} from 'react-icons/fa'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import Header from '../Header'
import LinkJobpost from '../LinkJobPost'
import './index.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]
const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    profileDetails: {},
    jobsData: [],
    userSearchInput: '',
    isUserProfileLoading: false,
    apiStatus: apiStatusConstants.initial,
    salaryRange: '',
    employmentType: [],
    employmentTypeString: '',
    userInput: '',
  }

  componentDidMount() {
    this.getUserDetails()
    this.getListofJobs()
  }

  getUserDetails = async () => {
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${Cookies.get('jwt_token')}`,
      },
    }
    const url = 'https://apis.ccbp.in/profile'
    const response = await fetch(url, options)
    const data = await response.json()
    const updatedProfileDetails = {
      name: data.profile_details.name,
      profileImageUrl: data.profile_details.profile_image_url,
      shortBio: data.profile_details.short_bio,
    }
    if (response.ok) {
      this.setState({
        profileDetails: updatedProfileDetails,
        isUserProfileLoading: true,
      })
    }
  }

  onChangeEmploymentType = event => {
    const {value, checked} = event.target

    this.setState(prevState => {
      let updatedEmploymentType
      if (checked) {
        updatedEmploymentType = [...prevState.employmentType, value]
      } else {
        updatedEmploymentType = prevState.employmentType.filter(
          type => type !== value,
        )
      }

      const str = updatedEmploymentType.join(',')

      return {employmentTypeString: str, employmentType: updatedEmploymentType}
    }, this.getListofJobs)
  }

  onChangeSalaryRange = event => {
    this.setState({salaryRange: event.target.value}, this.getListofJobs)
  }

  getListofJobs = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${Cookies.get('jwt_token')}`,
      },
    }
    const {userSearchInput, salaryRange, employmentTypeString} = this.state

    const url = `https://apis.ccbp.in/jobs?employment_type=${employmentTypeString}&minimum_package=${salaryRange}&search=${userSearchInput}`
    try {
      const response = await fetch(url, options)
      const jobsData = await response.json()
      if (response.ok) {
        const updatedJobsData = jobsData.jobs.map(each => ({
          companyLogoUrl: each.company_logo_url,
          employmentType: each.employment_type,
          id: each.id,
          location: each.location,
          jobDescription: each.job_description,
          packagePerAnnum: each.package_per_annum,
          rating: each.rating,
          title: each.title,
        }))
        this.setState({
          jobsData: updatedJobsData,
          apiStatus: apiStatusConstants.success,
        })
      } else {
        this.setState({
          apiStatus: apiStatusConstants.failure,
        })
      }
    } catch (error) {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  filteredJobs = filteredJobsData =>
    filteredJobsData.map(eachJobPost => (
      <LinkJobpost eachJobPost={eachJobPost} key={eachJobPost.id} />
    ))

  noJobsFound = () => (
    <div className="nojobs-found-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
        alt="no jobs"
      />
      <h1>No Jobs Found</h1>
      <p>We could not find any jobs. Try other filters</p>
    </div>
  )

  renderingSuccessView = () => {
    const {jobsData, userInput} = this.state
    const filteredJobsData = jobsData.filter(each =>
      each.title.toLowerCase().includes(userInput.toLowerCase()),
    )
    console.log(filteredJobsData)

    return (
      <ul className="list-of-jobs">
        <ul className="job-post-ul-list">
          {filteredJobsData.length > 0
            ? this.filteredJobs(filteredJobsData)
            : this.noJobsFound()}
        </ul>
      </ul>
    )
  }

  renderingFailureView = () => (
    <div className="failure-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <div className="failure-details-container">
        <h1>Oops! Something Went Wrong</h1>
        <p>We cannot seem to find the page you are looking for </p>

        <button
          type="button"
          className="logout-button"
          onClick={this.onClickRetryButton}
        >
          Retry
        </button>
      </div>
    </div>
  )

  onClickRetryButton = () => {
    this.getListofJobs()
  }

  renderingLoadingView = () => (
    <div className="loader-spinner">
      <Loader type="ThreeDots" height={50} width={50} color="#4f46e5" />
    </div>
  )

  onChangeSearchButton = event => {
    this.setState({userSearchInput: event.target.value})
  }

  onClickSearchButton = () => {
    const {userSearchInput} = this.state
    this.setState({userInput: userSearchInput})
  }

  render() {
    const {
      profileDetails,
      userSearchInput,
      isUserProfileLoading,
      apiStatus,
      employmentType,
    } = this.state
    const {name, profileImageUrl, shortBio} = profileDetails

    console.log(employmentType)
    return (
      <section>
        <Header />
        <div className="jobs-bg-container">
          <div className="user-details">
            {isUserProfileLoading ? (
              <div className="user-profile">
                <img src={profileImageUrl} alt="profile" />
                <h1>{name}</h1>
                <p>{shortBio}</p>
              </div>
            ) : (
              <div className="loader-spinner">
                <Loader
                  type="ThreeDots"
                  height={50}
                  width={50}
                  color="#4f46e5"
                  data-testid="loader"
                />
              </div>
            )}

            <hr />
            <ul className="types-of-employment">
              <p className="para1">Types of Employment</p>
              {employmentTypesList.map(eachType => (
                <li
                  className="type-of-employment"
                  key={eachType.employmentTypeId}
                >
                  <input
                    type="checkbox"
                    onChange={this.onChangeEmploymentType}
                    value={eachType.employmentTypeId}
                  />
                  <label>{eachType.label}</label>
                </li>
              ))}
            </ul>
            <hr />
            <ul className="types-of-salary-range">
              <p className="para2">Salary Range</p>
              {salaryRangesList.map(eachSalaryRange => (
                <li
                  className="type-of-salary-range"
                  key={eachSalaryRange.salaryRangeId}
                >
                  <input
                    type="radio"
                    name="salary-range"
                    onChange={this.onChangeSalaryRange}
                    value={eachSalaryRange.salaryRangeId}
                  />
                  <label>{eachSalaryRange.label}</label>
                </li>
              ))}
            </ul>
          </div>
          <div className="jobs-items-container">
            <div className="input-container-for-jobs">
              <input
                value={userSearchInput}
                type="search"
                placeholder="Search"
                onChange={this.onChangeSearchButton}
              />
              <button
                type="button"
                onClick={this.onClickSearchButton}
                className="search-container"
                aria-label="Search"
                data-testid="searchButton"
              >
                <FaSearch className="search-icon" />
              </button>
            </div>
            {(() => {
              switch (apiStatus) {
                case apiStatusConstants.success:
                  return this.renderingSuccessView()
                case apiStatusConstants.failure:
                  return this.renderingFailureView()
                case apiStatusConstants.inProgress:
                  return this.renderingLoadingView()
                default:
                  return null
              }
            })()}
          </div>
        </div>
      </section>
    )
  }
}
export default Jobs
